package ast;
import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of ASTnode that represents
 * variable declaration statement in Python program.
 */
public final class ASTDeclarationStatementP extends ASTDeclarationStatement {
	//1 declaration statement can associate with multiple variables
	//but all of them need to be initialized
	private ArrayList<ASTExpressionAssignment> variables = new ArrayList<ASTExpressionAssignment>();
	public ASTDeclarationStatementP() {
		super();
	}
	//code construction
	//format:
	//a,b,c = 1,"hi",3.0
	public void AddAVariable(ASTExpressionAssignment exp){
		exp.addParent(this);
		this.variables.add(exp);
	}
	public String toSyntax(){
		this.result = "";
		for(int i = 0;i<this.variables.size();i++){
			this.result+= this.variables.get(i).getObject().toSyntax();
			if(i!=this.variables.size()-1){
				this.result+= ", ";
			}
		}
		this.result += " = ";
		for(int i = 0;i<this.variables.size();i++){
			this.result+= this.variables.get(i).getExp().toSyntax();
			if(i!=this.variables.size()-1){
				this.result+= ", ";
			}
		}
		return this.result+"\n";
	}
}
