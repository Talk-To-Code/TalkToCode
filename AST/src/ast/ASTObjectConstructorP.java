package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of syntax generation of object constructor declaration
 * in Python programs
 *
 */
public class ASTObjectConstructorP extends ASTObjectConstructor {

	public ASTObjectConstructorP() {
		super();
	}
	//syntax generation
	public String toSyntax(){
		this.result = "def __init__(self, ";

		for(int i = 0;i<this.parameters.size();i++){

			this.result+=this.parameters.get(i).toSyntax();
			if(i!=this.parameters.size()-1){
				this.result+=", ";
			}
		}
		this.result+="):\n";
		for(ASTStatement s:this.statements){
			this.result+="\t";
			this.result+=s.toSyntax();
			this.result+="\n";
		}
		this.result+="\n";
		return this.result;
	}
}
